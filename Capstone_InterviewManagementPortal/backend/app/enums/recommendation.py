from enum import Enum


class Recommendation(str, Enum):
    NEXT_ROUND = "NEXT_ROUND"
    SELECT = "SELECT"
    REJECT = "REJECT"
