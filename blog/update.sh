#!/bin/bash
git submodule update --remote --merge
git add *
git commit -m "chore(deps): bump blowfish theme in /blog" 
git push