import os
from PIL import Image, ImageDraw, ImageFont

def process_smartwatch():
    print("Processing smartwatch images...")
    img_path = "assets/smartwatch.jpg"
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found.")
        return
        
    img = Image.open(img_path)
    
    # Save original as smartwatch_a.jpg
    img.save("assets/smartwatch_a.jpg", "JPEG", quality=98)
    
    # Create Image B
    img_b = img.copy()
    draw = ImageDraw.Draw(img_b)
    
    # Draw hot pink dead-pixel cluster (5x5 square) at (580, 550)
    draw.rectangle([580, 550, 584, 554], fill=(255, 0, 170))
    
    # Draw text label "QA-PASS v1.0" at (495, 615)
    try:
        font = ImageFont.truetype("courier.ttf", 12)
    except IOError:
        try:
            font = ImageFont.truetype("Courier New.ttf", 12)
        except IOError:
            font = ImageFont.load_default()
            
    draw.text((495, 615), "QA-PASS v1.0", fill=(0, 255, 100), font=font)
    
    # Save Image B with low quality JPEG to introduce macroblock compression artifacts
    img_b.save("assets/smartwatch_b.jpg", "JPEG", quality=65)
    print("Generated assets/smartwatch_a.jpg and assets/smartwatch_b.jpg successfully.")

def process_headset():
    print("Processing VR headset images...")
    img_path = "assets/vr_headset.jpg"
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found.")
        return
        
    img = Image.open(img_path)
    
    # Save original as vr_headset_a.jpg
    img.save("assets/vr_headset_a.jpg", "JPEG", quality=98)
    
    # Create Image B with chromatic aberration shift (shift red left, blue right by 4 pixels)
    r, g, b = img.split()
    
    # Red shifted left by 4 pixels
    r_shifted = Image.new("L", r.size, 0)
    r_shifted.paste(r.crop((4, 0, r.width, r.height)), (0, 0))
    
    # Blue shifted right by 4 pixels
    b_shifted = Image.new("L", b.size, 0)
    b_shifted.paste(b.crop((0, 0, b.width - 4, b.height)), (4, 0))
    
    # Merge channels
    img_b = Image.merge("RGB", (r_shifted, g, b_shifted))
    
    # Draw a subtle hairline scratch on the visor from (810, 440) to (845, 460)
    draw = ImageDraw.Draw(img_b)
    draw.line([810, 440, 845, 460], fill=(200, 200, 200), width=1)
    
    # Save Image B as high-quality JPEG
    img_b.save("assets/vr_headset_b.jpg", "JPEG", quality=95)
    print("Generated assets/vr_headset_a.jpg and assets/vr_headset_b.jpg successfully.")

if __name__ == "__main__":
    process_smartwatch()
    process_headset()
