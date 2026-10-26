from PIL import Image, ImageFilter
import numpy as np

def make_background_transparent(input_path, output_path, threshold=235):
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # Extract R, G, B, A
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # Identify near white pixels
    white_mask = (r > threshold) & (g > threshold) & (b > threshold)
    
    # Set alpha of white pixels to 0
    data[:, :, 3][white_mask] = 0
    
    # Also handle soft edges / anti-aliasing near white:
    # If a pixel is very light, scale its alpha proportionally
    light_mask = (r > 200) & (g > 200) & (b > 200) & (~white_mask)
    # Smooth gradient alpha for edge transition
    brightness = (r[light_mask].astype(float) + g[light_mask].astype(float) + b[light_mask].astype(float)) / 3.0
    alpha_factor = (255.0 - brightness) / (255.0 - 200.0)
    data[:, :, 3][light_mask] = (data[:, :, 3][light_mask].astype(float) * alpha_factor).astype(np.uint8)

    new_img = Image.fromarray(data)
    new_img.save(output_path, "PNG")
    print(f"Processed {input_path} -> {output_path}")

try:
    make_background_transparent("public/laptop.png", "public/laptop.png", threshold=238)
    make_background_transparent("public/instax-camera.png", "public/instax-camera.png", threshold=240)
    make_background_transparent("public/game-controller.png", "public/game-controller.png", threshold=240)
except Exception as e:
    print("Error processing images:", e)
