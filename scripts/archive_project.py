#!/usr/bin/env python3
import os
import subprocess
import zipfile
import sys
from pathlib import Path

def get_non_ignored_files(repo_root):
    """Gets the list of non-ignored files using git ls-files."""
    try:
        # Run git ls-files from the repo root to get cached (tracked) and other (untracked) non-ignored files
        result = subprocess.run(
            ["git", "ls-files", "--cached", "--others", "--exclude-standard"],
            cwd=repo_root,
            capture_output=True,
            text=True,
            check=True
        )
        # Filter out empty lines and convert to Path objects relative to repo_root
        files = [line.strip() for line in result.stdout.split('\n') if line.strip()]
        return files
    except subprocess.CalledProcessError as e:
        print(f"Error running git ls-files: {e}", file=sys.stderr)
        return []
    except FileNotFoundError:
        print("Git is not installed or not in PATH.", file=sys.stderr)
        return []

def create_zip(output_filename="project.zip"):
    # Find the repository root (directory containing .git)
    current_dir = Path(__file__).resolve().parent
    repo_root = None
    for parent in [current_dir] + list(current_dir.parents):
        if (parent / ".git").is_dir():
            repo_root = parent
            break
            
    if not repo_root:
        print("Error: Could not find Git repository root.", file=sys.stderr)
        sys.exit(1)

    files = get_non_ignored_files(repo_root)
    if not files:
        print("No files found to archive.", file=sys.stderr)
        sys.exit(1)

    # Determine absolute output path
    output_path = Path(output_filename).resolve()
    
    # Check if output is inside the repository, so we can avoid archiving it
    try:
        rel_output_path = output_path.relative_to(repo_root)
        rel_output_str = str(rel_output_path)
    except ValueError:
        rel_output_str = None

    print(f"Creating zip archive '{output_filename}' containing {len(files)} files...")
    
    count = 0
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for file_rel_path in files:
            # Skip the output zip itself if it's created inside the repo
            if rel_output_str and file_rel_path == rel_output_str:
                continue
                
            abs_path = repo_root / file_rel_path
            
            if not abs_path.exists():
                # Skip if the file doesn't exist physically (e.g. deleted but still in index)
                continue
                
            if abs_path.is_file():
                # Add to zip using its relative path inside the repo
                zip_file.write(abs_path, arcname=file_rel_path)
                count += 1
                
    print(f"Successfully created '{output_filename}' with {count} files!")

if __name__ == "__main__":
    output_name = "project.zip"
    if len(sys.argv) > 1:
        output_name = sys.argv[1]
    create_zip(output_name)
