import os

src_dir = r"c:\Users\Electronica\OneDrive\سطح المكتب\doctor-dashboard-main\doctor-dashboard-main\src"

found = []
for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith((".jsx", ".js")):
            p = os.path.join(root, f)
            with open(p, "r", encoding="utf-8") as file:
                try:
                    content = file.read()
                    if "initialDoctorsData" in content or "hospital/doctors" in content:
                        found.append(p)
                except Exception:
                    pass

print("Files importing/using mock doctors data:")
for f in found:
    print("  -", f)
