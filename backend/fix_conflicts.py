import os
import re

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if '<<<<<<< HEAD' not in content:
            return

        pattern = re.compile(r'<<<<<<< HEAD\n(.*?)=======\n.*?>>>>>>>[^\n]*\n', re.DOTALL)
        new_content, count = pattern.subn(r'\1', content)
        
        if count > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Fixed {count} conflicts in {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

if __name__ == '__main__':
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith(('.js', '.jsx')):
                fix_file(os.path.join(root, file))
