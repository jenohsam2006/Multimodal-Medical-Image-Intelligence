import io
import base64
import numpy as np
from PIL import Image
from .schemas import ImageQualityResult

def decode_base64_image(image_base64: str) -> Image.Image:
    if "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]
    image_bytes = base64.b64decode(image_base64)
    return Image.open(io.BytesIO(image_bytes)).convert("RGB")

def assess_image_quality(img: Image.Image) -> ImageQualityResult:
    width, height = img.size
    gray = img.convert("L")
    arr = np.array(gray, dtype=np.float32)

    # 1. Sharpness calculation using discrete Laplacian approximation
    # Laplacian kernel: [[0, 1, 0], [1, -4, 1], [0, 1, 0]]
    if arr.shape[0] > 4 and arr.shape[1] > 4:
        center = arr[1:-1, 1:-1]
        top = arr[:-2, 1:-1]
        bottom = arr[2:, 1:-1]
        left = arr[1:-1, :-2]
        right = arr[1:-1, 2:]
        laplacian = top + bottom + left + right - 4 * center
        sharpness_var = float(np.var(laplacian))
    else:
        sharpness_var = 10.0

    # 2. Contrast & Dynamic Range
    std_contrast = float(np.std(arr))
    mean_luminance = float(np.mean(arr))

    # Pixel clipping checks
    under_exposed_ratio = float(np.mean(arr < 12))
    over_exposed_ratio = float(np.mean(arr > 243))

    warnings = []

    # Sharpness scoring (scale 0-100)
    # Typical sharp chest radiograph has laplacian variance > 120
    sharpness_score = min(100.0, (sharpness_var / 120.0) * 100.0)
    sharpness_penalty = 0.0
    if sharpness_var < 20.0:
        warnings.append("CRITICAL: Severe motion blur / loss of diagnostic bronchovascular detail detected.")
        sharpness_penalty = 40.0
    elif sharpness_var < 45.0:
        warnings.append("Significant blur / loss of fine bronchovascular markings detected.")
        sharpness_penalty = 20.0
    elif sharpness_var < 65.0:
        warnings.append("Mild motion or focus softness observed; fine interstitial details may be obscured.")

    # Contrast scoring (scale 0-100)
    contrast_score = min(100.0, (std_contrast / 55.0) * 100.0)
    if std_contrast < 24.0:
        warnings.append("Sub-optimal dynamic contrast: low distinction between lung fields and mediastinum.")

    # Exposure check
    exposure_penalty = 0.0
    if under_exposed_ratio > 0.20:
        exposure_penalty += 25.0
        warnings.append(f"Under-exposure detected ({under_exposed_ratio*100:.1f}% dark clipping).")
    if over_exposed_ratio > 0.18:
        exposure_penalty += 25.0
        warnings.append(f"Over-exposure burnout detected ({over_exposed_ratio*100:.1f}% saturation).")

    # Resolution check
    res_score = 100.0
    if min(width, height) < 380:
        res_score = 40.0
        warnings.append(f"Low image resolution ({width}x{height}); guideline standard recommends >= 512x512.")
    elif min(width, height) < 512:
        res_score = 75.0
        warnings.append(f"Borderline resolution ({width}x{height}); zoom fidelity may be degraded.")

    # Composite Score
    composite = (
        (sharpness_score * 0.40) +
        (contrast_score * 0.30) +
        (res_score * 0.15) +
        (max(0.0, 100.0 - exposure_penalty) * 0.15)
    ) - sharpness_penalty

    final_score = int(np.clip(composite, 5, 100))

    if final_score >= 70 and sharpness_var >= 45:
        status = "Diagnostic Quality"
        is_poor = False
        recommendation = "Image is adequate for clinical computer-assisted evaluation."
    elif final_score >= 48 and sharpness_var >= 25:
        status = "Borderline / Degraded"
        is_poor = False
        recommendation = "Image exhibits slight degradation; interpret subtle findings with heightened clinical discretion."
    else:
        status = "Non-Diagnostic / Poor Quality"
        is_poor = True
        recommendation = "CRITICAL: Image quality is insufficient for dependable diagnostic inference. Recommend repeat acquisition."

    return ImageQualityResult(
        score=final_score,
        status=status,
        sharpness=round(sharpness_var, 2),
        contrast=round(std_contrast, 2),
        brightness_mean=round(mean_luminance, 1),
        resolution=f"{width}x{height}",
        warnings=warnings,
        is_poor_quality=is_poor,
        recommendation=recommendation
    )
