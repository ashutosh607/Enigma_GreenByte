import pytest
from pydantic import ValidationError
from ps5.engine import converted
from ps5.knowledge import citations
from ps5.models import Range, Scenario


def test_unit_conversions():
    assert converted(42000, "ppm", "%") == pytest.approx(4.2)
    assert converted(1000, "um", "mm") == 1
    assert converted(1, "pH", "%") is None


def test_citation_preserves_chunk_and_doi():
    result = citations("10.1016/j.seppur.2023.124631_chunk65, 10.1002/app.55437")
    assert result[0]["doi"] == "10.1016/j.seppur.2023.124631"
    assert result[0]["chunk"] == "65"
    assert len(result) == 2


def test_invalid_ranges_and_mutually_exclusive_ratios():
    with pytest.raises(ValidationError):
        Range(low=10, high=1)
    with pytest.raises(ValidationError):
        Range(low=float("nan"), high=1)
    with pytest.raises(ValidationError):
        Scenario(yield_fraction=Range(low=.8, high=.9), input_tonnes_per_output_tonne=Range(low=1, high=2))
