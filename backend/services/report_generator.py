from typing import List
from ..models import Report, Answer

def generate_report(company_size: str, answers: List[Answer]) -> Report:
    # MVP Logic: Heuristic based on company size
    
    mindset_shift = "Unknown"
    operational_focus = "General Optimization"
    next_move = "Review Strategy"
    cta_type = "join_list"
    
    if company_size == "15-35":
        mindset_shift = "From 'Doing' to 'Leading'"
        operational_focus = "Delegation & Process Foundation"
        next_move = "Hire a key operator or document core processes."
        cta_type = "consult"
    elif company_size == "36-60":
        mindset_shift = "From 'Leading Team' to 'Leading Leaders'"
        operational_focus = "Management Layer & Culture"
        next_move = "Establish clear management cadence and KPIs."
        cta_type = "consult"
    elif company_size == "61-95":
        mindset_shift = "From 'Growth' to 'Scale'"
        operational_focus = "Cross-functional Alignment"
        next_move = "Implement unified strategic planning."
        cta_type = "join_list"
    elif company_size == "96-200":
        mindset_shift = "From 'Scale' to 'Enterprise'"
        operational_focus = "Governance & Long-term Strategy"
        next_move = "Solidify executive team and board reporting."
        cta_type = "join_list"
        
    full_report_text = f"""
Based on your company size of {company_size}, your primary challenge is shifting your mindset {mindset_shift}.

Your operational focus should be on {operational_focus}.

Your recommended next move is to {next_move}.
    """
    
    return Report(
        mindset_shift=mindset_shift,
        operational_focus=operational_focus,
        next_move=next_move,
        cta_type=cta_type,
        full_report_text=full_report_text.strip()
    )