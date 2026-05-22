import os
import glob

directory = r'c:\Users\ismail\WEB_dev\port\project_details'
html_files = glob.glob(os.path.join(directory, '*.html'))

favicon_tag = '    <link rel="icon" type="image/svg+xml" href="../assets/logo.svg">'

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'logo.svg' not in content:
        if '</title>' in content:
            parts = content.split('</title>')
            new_content = parts[0] + '</title>\n' + favicon_tag + parts[1]
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print('Updated ' + file_path)
