def analyze_report(report) -> None:
    """Placeholder until the trained model is connected.

    It does NOT invent a disease. The report stays 'pending' and goes to the sector officer.
    Later this function will: run the image model, turn a voice note into text, and fill in
    predicted_disease, confidence, ai_symptoms, ai_advice and result_audio_path.
    """
    report.ai_advice = (
        "Your report was received. An automatic diagnosis is not available yet. "
        "An agricultural officer in your sector will review your report."
    )
