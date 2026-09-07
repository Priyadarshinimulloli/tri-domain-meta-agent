from core.llm_client import call_llm
from core.safety_layer import normalize_query, DOMAIN_KEYWORDS, keyword_matches

# ── High-signal domain terms ─────────────────────────────────────────────
# These words strongly indicate a specific domain even when other domains
# also appear in the query (e.g. "job" + "financial" → finance should win).
# Each carries extra weight so a single strong signal outweighs a weak
# generic keyword from another domain.
HIGH_SIGNAL = {
    "career": [
        "resume", "cv", "interview", "promotion", "linkedin", "internship",
        "career", "salary negotiation", "job switch", "switch career",
        "skill gap", "target role", "data scientist", "data analyst",
        "product manager", "developer", "engineer", "fresher",
    ],
    "health": [
        "bmi", "weight loss", "weight gain", "workout", "diet", "sleep",
        "fitness", "nutrition", "calories", "anxiety", "depression",
        "blood pressure", "diabetes", "exercis", "meditation", "wellness",
        "fever", "cough", "headache", "pain", "symptom", "cold", "infection",
        "allergy", "migraine",
    ],
    "finance": [
        "budget", "savings", "invest", "investing", "debt", "loan", "emi",
        "tax", "sip", "ppf", "mutual fund", "stock", "retirement", "pension",
        "financial", "income", "expense", "expenses", "credit card",
        "emergency fund", "net worth", "insurance", "atax", "sip",
    ],
}


def detect_intent(query: str) -> dict:
    """
    Detects which domain(s) a query belongs to.
    Uses DOMAIN_KEYWORDS from safety_layer — single source of truth.
    No duplicate keyword lists.

    Uses weighted scoring: high-signal terms (e.g. "financial", "budget",
    "bmi", "resume") carry more weight than generic terms (e.g. "job",
    "work", "money") so a query mixing two domains routes to the domain
    with the strongest, most specific signal.
    """
    query_lower = normalize_query(query)

    if not query_lower:
        return {
            "domains":    ["general"],
            "confidence": 0.0,
            "reasoning":  "Empty query"
        }

# ── Use shared DOMAIN_KEYWORDS — no duplicate list ────────
    matched = []
    match_scores = {}

    for domain, keywords in DOMAIN_KEYWORDS.items():
        score = 0
        for kw in keywords:
            if keyword_matches(query_lower, kw):
                # High-signal terms count double so strong intent wins ties
                is_high_signal = any(
                    keyword_matches(query_lower, hs) for hs in HIGH_SIGNAL.get(domain, [])
                )
                score += 2 if is_high_signal else 1
        if score > 0:
            matched.append(domain)
            match_scores[domain] = score

    # ── No match fallback ─────────────────────────────────────
    if not matched:
        return {
            "domains":    ["general"],
            "confidence": 0.5,
            "reasoning":  "No clear domain detected"
        }

    # ── Sort by match strength ────────────────────────────────
    matched = sorted(matched, key=lambda d: match_scores[d], reverse=True)

    # ── Confidence based on number of domains ─────────────────
    if len(matched) == 1:
        confidence = 0.85
    elif len(matched) == 2:
        confidence = 0.90
    else:
        confidence = 0.95

    reasoning = f"Detected domains: {', '.join(matched)} based on keyword matches (weighted)"

    return {
        "domains":    matched,
        "confidence": confidence,
        "reasoning":  reasoning
    }
