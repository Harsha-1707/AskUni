
import os
import glob

def generate_report():
    base_path = "data/raw/anurag_edu_in"
    if not os.path.exists(base_path):
        print("No data found.")
        return

    files = glob.glob(os.path.join(base_path, "**", "*.*"), recursive=True)
    total_files = len(files)
    
    categories = set()
    sources = []
    
    for f in files:
        cat = os.path.basename(os.path.dirname(f))
        categories.add(cat)
        
        # Try to read source from first line if text
        if f.endswith(".txt"):
            try:
                with open(f, "r", encoding="utf-8") as file:
                    first_line = file.readline().strip()
                    if first_line.startswith("Source:"):
                        sources.append(first_line.replace("Source: ", ""))
            except:
                pass
        elif f.endswith(".pdf"):
            pass # Can't easily read source from binary PDF content unless stored in metadata which we didn't do perfectly for naming key

    print(f"Total Documents: {total_files}")
    print(f"Categories Covered: {sorted(list(categories))}")
    print(f"Sources Sample ({min(5, len(sources))} of {len(sources)}):")
    for s in sources[:5]:
        print(f" - {s}")

if __name__ == "__main__":
    generate_report()
