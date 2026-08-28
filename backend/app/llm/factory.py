import json
import logging
import httpx
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class LLMProvider:
    """Base interface for LLM providers."""
    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        fallback_generator=None,
        custom_api_key: Optional[str] = None,
        images: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        raise NotImplementedError

class GeminiProvider(LLMProvider):
    """Google Gemini AI Studio Provider (100% Free)."""
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        fallback_generator=None,
        custom_api_key: Optional[str] = None,
        images: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        key = custom_api_key or self.api_key
        if not key:
            if fallback_generator:
                return await fallback_generator()
            return {}

        model_candidates = [
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-flash-8b",
            "gemini-2.5-flash",
            "gemini-1.5-pro",
            "gemini-pro"
        ]
        
        parts: List[Dict[str, Any]] = [
            {"text": f"{system_prompt}\n\nUser: {user_prompt}\n\nPlease respond clearly in helpful markdown."}
        ]
        
        if images:
            for img in images:
                if img.get("data"):
                    parts.append({
                        "inlineData": {
                            "mimeType": img.get("mime_type", "image/png"),
                            "data": img.get("data")
                        }
                    })

        for model in model_candidates:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
                payload = {
                    "contents": [
                        {
                            "role": "user",
                            "parts": parts
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.7
                    }
                }
                async with httpx.AsyncClient(timeout=25.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            raw_text = candidates[0]["content"]["parts"][0]["text"].strip()
                            # If it returned json wrapped or raw text, clean it
                            if raw_text.startswith("```json"):
                                raw_text = raw_text.split("```json", 1)[1].split("```", 1)[0].strip()
                            elif raw_text.startswith("```"):
                                raw_text = raw_text.split("```", 1)[1].split("```", 1)[0].strip()
                            try:
                                parsed = json.loads(raw_text)
                                if isinstance(parsed, dict) and "response" in parsed:
                                    return parsed
                                elif isinstance(parsed, dict):
                                    return parsed
                            except Exception:
                                pass
                            return {"response": raw_text}
                    else:
                        logger.warning(f"Gemini API model {model} returned status {resp.status_code}: {resp.text[:100]}")
            except Exception as e:
                logger.warning(f"Gemini API model {model} error: {e}")

        if fallback_generator:
            return await fallback_generator()
        return {}


class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: str = settings.OPENAI_API_KEY, model: str = settings.OPENAI_MODEL, base_url: str = "https://api.openai.com/v1"):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url.rstrip("/")

    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        fallback_generator=None,
        custom_api_key: Optional[str] = None,
        images: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        key_to_use = custom_api_key or self.api_key
        if not key_to_use:
            if fallback_generator:
                return await fallback_generator()
            return {}

        # If it's a Google Gemini key (starts with AIzaSy or AQ. or anything non sk-/gsk_)
        if key_to_use.startswith("AIzaSy") or key_to_use.startswith("AQ.") or not key_to_use.startswith("sk-") and not key_to_use.startswith("gsk_"):
            gemini = GeminiProvider(api_key=key_to_use)
            return await gemini.generate_json(system_prompt, user_prompt, fallback_generator, custom_api_key=key_to_use, images=images)

        base = self.base_url
        model_candidates = [self.model or "gpt-4o-mini"]

        if key_to_use.startswith("gsk_"):
            base = "https://api.groq.com/openai/v1"
            model_candidates = [
                "llama-3.3-70b-versatile",
                "llama-3.1-8b-instant",
                "mixtral-8x7b-32768",
                "gemma2-9b-it"
            ]

        user_msg_content: Any = user_prompt
        if images and not key_to_use.startswith("gsk_"):
            user_msg_content = [{"type": "text", "text": user_prompt}]
            for img in images:
                if img.get("data"):
                    data_uri = f"data:{img.get('mime_type', 'image/png')};base64,{img.get('data')}"
                    user_msg_content.append({
                        "type": "image_url",
                        "image_url": {"url": data_uri}
                    })

        for model_name in model_candidates:
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    headers = {
                        "Authorization": f"Bearer {key_to_use}",
                        "Content-Type": "application/json"
                    }
                    payload: Dict[str, Any] = {
                        "model": model_name,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_msg_content}
                        ],
                        "temperature": 0.7
                    }
                    
                    response = await client.post(f"{base}/chat/completions", headers=headers, json=payload)
                    if response.status_code == 200:
                        data = response.json()
                        content = data["choices"][0]["message"]["content"].strip()
                        # Clean markdown code blocks if wrapped
                        if content.startswith("```json"):
                            content_clean = content.split("```json", 1)[1].split("```", 1)[0].strip()
                            try:
                                parsed = json.loads(content_clean)
                                if isinstance(parsed, dict) and "response" in parsed:
                                    return parsed
                                elif isinstance(parsed, dict):
                                    return parsed
                            except Exception:
                                pass
                        elif content.startswith("```"):
                            content_clean = content.split("```", 1)[1].split("```", 1)[0].strip()
                            try:
                                parsed = json.loads(content_clean)
                                if isinstance(parsed, dict) and "response" in parsed:
                                    return parsed
                                elif isinstance(parsed, dict):
                                    return parsed
                            except Exception:
                                pass
                        try:
                            parsed = json.loads(content)
                            if isinstance(parsed, dict) and "response" in parsed:
                                return parsed
                            elif isinstance(parsed, dict):
                                return parsed
                        except Exception:
                            pass
                        return {"response": content}
                    else:
                        logger.warning(f"LLM API model {model_name} error status {response.status_code}: {response.text[:100]}")
            except Exception as e:
                logger.warning(f"LLM API model {model_name} error: {e}")

        if fallback_generator:
            return await fallback_generator()
        return {}


class SimulatedLLMProvider(LLMProvider):
    """High-fidelity contextual simulation engine with dynamic fallback."""
    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        fallback_generator=None,
        custom_api_key: Optional[str] = None,
        images: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        if custom_api_key:
            # Check if Gemini key
            if custom_api_key.startswith("AIzaSy") or custom_api_key.startswith("AQ.") or (not custom_api_key.startswith("sk-") and not custom_api_key.startswith("gsk_")):
                gemini = GeminiProvider(api_key=custom_api_key)
                res = await gemini.generate_json(system_prompt, user_prompt, fallback_generator=None, custom_api_key=custom_api_key, images=images)
                if res and "response" in res:
                    return res
            else:
                provider = OpenAIProvider(api_key=custom_api_key)
                res = await provider.generate_json(system_prompt, user_prompt, fallback_generator=None, custom_api_key=custom_api_key, images=images)
                if res and "response" in res:
                    return res

        if fallback_generator:
            return await fallback_generator()
        return {}


class LLMFactory:
    @staticmethod
    def get_llm(api_key: Optional[str] = None) -> LLMProvider:
        if api_key:
            if api_key.startswith("AIzaSy") or api_key.startswith("AQ.") or (not api_key.startswith("sk-") and not api_key.startswith("gsk_")):
                return GeminiProvider(api_key=api_key)
            return OpenAIProvider(api_key=api_key)
        return get_llm_provider()

def get_llm_provider(override_provider: Optional[str] = None) -> LLMProvider:
    """Factory to get the appropriate LLM provider."""
    provider_name = (override_provider or settings.DEFAULT_LLM_PROVIDER).lower()
    
    if provider_name == "openai" and settings.OPENAI_API_KEY:
        return OpenAIProvider()
    else:
        return SimulatedLLMProvider()

