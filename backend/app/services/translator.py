import logging
from deep_translator import GoogleTranslator

logger = logging.getLogger(__name__)

# Map Alaafia frontend language names to Google Translate ISO codes
LANGUAGE_MAP = {
    "English": "en",
    "en": "en",
    "Yoruba": "yo",
    "yo": "yo",
    "Hausa": "ha",
    "ha": "ha",
    "Igbo": "ig",
    "ig": "ig",
    "Pidgin": "en", # Fallback Pidgin to English for translation
}

def translate_text(text: str, source: str, target: str) -> str:
    """
    Translates text between two languages using deep_translator (Google Translate).
    If source and target are the same, or if an error occurs, returns the original text.
    """
    if not text or not text.strip():
        return text

    source_code = LANGUAGE_MAP.get(source, "en")
    target_code = LANGUAGE_MAP.get(target, "en")

    if source_code == target_code:
        return text

    try:
        translated = GoogleTranslator(source=source_code, target=target_code).translate(text)
        return translated
    except Exception as e:
        logger.error(f"Translation failed from {source_code} to {target_code}: {e}")
        return text
