
from PIL import Image
import sys
import os

def remove_black_background(input_path, output_path):
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # If pixel is black (allowing some variance), make it transparent
            if item[0] < 30 and item[1] < 30 and item[2] < 30: 
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Successfully processed logo to {output_path}")
    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        remove_black_background(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python process_logo.py <input> <output>")
