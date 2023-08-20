
## How to clone a GitHub repository

1. Create a GitHub account at https://github.com/. I will add you to our organization, where you can access the projects, repositories, etc.
2. Under the green dropdown “Code,” select HTTPS and copy the link provided.
3. Install VSCode. https://code.visualstudio.com/download
4. Install the most recent version of Git. https://git-scm.com/downloads During installation, you will be asked to choose a credential helper. Select “Git Credential Manager Core.”
5. Open your desktop files. Create a new folder somewhere you can find easily. Name the folder “VSCode Projects” or similar. Recommended place - \Users\your-user\Documents\VSCode Projects\
6. Open your terminal. You will probably see something like this (my user is “ruoha”):

    ```
    PS C:\Users\ruoha>
    ```

7. Type `cd` and a space.

    ```
    PS C:\Users\ruoha> cd 
    ```

8. Write the name of the “next” folder, for example:

    ```
    PS C:\Users\ruoha> cd Documents
    ```

    Or, start typing the folder’s name and press “Tab.” (The terminal will autocomplete the folder name.)

9. Write the names of the next folders, each separated with a slash (/). It will be easier to use autocomplete on folder names.

    ```
    PS C:\Users\ruoha> cd '.\Documents\VSCode Projects\'
    ```

10. Press “enter.” You’re now in the folder “VSCode Projects.”

11. Now, type `git clone` and a space.

    Paste the HTTPS link from the repo, and press “enter.”

    You’ll see the terminal say, “Cloning into ‘repo-name’...” and some statements with “done” at the end. This means a successful clone.

12. Make sure you’re in the folder “VSCode Projects” (see “v” in step “e” above).

    Type `cd` and a space.

    Then, type the name of the cloned repo. Press “enter.”
    Now that you’re in the repo’s folder, type `code .`

    Something like this (the example repo is named “easyu”):

```
PS C:\Users\ruoha\Documents\VSCode Projects\easyu> code .
```

13. Wait a few seconds. As long as you’ve followed all the steps prior, the code will open on VSCode.


If you encounter any error messages or unexpected statements, let me know, and send a screenshot of the problem. (Or try to figure it out yourself!)
