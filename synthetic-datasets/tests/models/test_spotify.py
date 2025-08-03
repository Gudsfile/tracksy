import pytest

from synthetic_datasets.models.spotify import ReasonEndEnum, Streaming


@pytest.mark.parametrize("skipped, reason_end",[
        (True, ReasonEndEnum.BACK_BUTTON),
        (True, ReasonEndEnum.FORWARD_BUTTON),
        (False, ReasonEndEnum.TRACK_DONE),
        (False, ReasonEndEnum.REMOTE),
])  # fmt: skip
def test_valid_reason_end(skipped, reason_end, streaming_record):
    # given
    data = streaming_record.model_dump().copy()
    data["skipped"] = skipped
    data["reason_end"] = reason_end
    # when
    streaming = Streaming(**data)  # ty: ignore[missing-argument] # https://github.com/astral-sh/ty/issues/247
    # then
    assert streaming.reason_end == reason_end


@pytest.mark.parametrize("skipped, reason_end, error_msg", [
    (True, ReasonEndEnum.TRACK_DONE, "The end reason must be `backbtn` or `fwdbtn` if streaming is skipped: reason_end: `{reason_end}`"),
    (True, ReasonEndEnum.REMOTE, "The end reason must be `backbtn` or `fwdbtn` if streaming is skipped: reason_end: `{reason_end}`"),
    (False, ReasonEndEnum.BACK_BUTTON, "The end reason must not be `backbtn` or `fwdbtn` if streaming is not skipped: reason_end: `{reason_end}`"),
    (False, ReasonEndEnum.FORWARD_BUTTON, "The end reason must not be `backbtn` or `fwdbtn` if streaming is not skipped: reason_end: `{reason_end}`"),
])  # fmt: skip
def test_invalid_reason_end(skipped, reason_end, error_msg, streaming_record):
    # given
    data = streaming_record.model_dump().copy()
    data["skipped"] = skipped
    data["reason_end"] = reason_end
    # when
    with pytest.raises(ValueError) as err:
        Streaming(**data)  # ty: ignore[missing-argument] # https://github.com/astral-sh/ty/issues/247
    # then
    assert error_msg.replace("{reason_end}", reason_end.value) in str(err.value)
