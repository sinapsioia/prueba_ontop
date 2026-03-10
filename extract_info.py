import docx
import pandas as pd

def extract_case_details():
    doc = docx.Document('Business Case_ CS Operations Lead Technical Challenge.docx')
    with open('case_text.md', 'w', encoding='utf-8') as f:
        f.write('# Business Case Text\n\n')
        for p in doc.paragraphs:
            f.write(p.text + '\n')
    print("Extracted case_text.md")

def inspect_data():
    xl = pd.ExcelFile('Data Business Case.xlsx')
    with open('data_info.md', 'w', encoding='utf-8') as f:
        f.write(f'# Data Info\n\nSheets: {xl.sheet_names}\n\n')
        for sheet in xl.sheet_names:
            df = pd.read_excel('Data Business Case.xlsx', sheet_name=sheet)
            f.write(f'## Sheet: {sheet}\n')
            f.write(f'**Shape:** {df.shape}\n\n')
            f.write('**Columns:** ' + ', '.join(df.columns) + '\n\n')
            f.write('### Info\n```\n')
            # Capture df.info() as a string
            import io
            buf = io.StringIO()
            df.info(buf)
            f.write(buf.getvalue())
            f.write('\n```\n\n')
            f.write('### Head\n\n')
            f.write(df.head().to_string() + '\n\n')
    print("Extracted data_info.md")

if __name__ == "__main__":
    extract_case_details()
    inspect_data()
