# Anti-Procrastination Schedule

## Description
Coming soon!

## How to clone a GitHub repository

*Note: I use Windows Terminal, which is different from other terminals like Linux. Some examples of terminal lines below may not apply.*

1. Create a GitHub account at https://github.com/. I will add you to our organization, where you can access the projects, repositories, etc.
2. Under the green dropdown “Code” in a repository, select HTTPS and copy the link provided.
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

    Or, start typing the folder’s name and press TAB. (The terminal will autocomplete the folder name.)

9. Write the names of the next folders, each separated with a slash (/). It will be easier to use autocomplete on folder names.

    ```
    PS C:\Users\ruoha> cd '.\Documents\VSCode Projects\'
    ```

10. Press ENTER. You’re now in the folder “VSCode Projects.”

    ```
    PS C:\Users\ruoha\Documents\VSCode Projects>
    ```

12. Now, type `git clone` and a space.

    Paste the HTTPS link from the repo, and press ENTER.

    You’ll see the terminal say, “Cloning into ‘repo-name’...” and some statements with “done” at the end. This means a successful clone.

13. Make sure you’re in the folder “VSCode Projects” (see Step 10 above).

    Type `cd` and a space. Then, type the name of the cloned repo. Press ENTER.
    
14. Now that you’re in the repo’s folder, type `code .`

    Something like this (the example repo is named “easyu”):

    ```
    PS C:\Users\ruoha\Documents\VSCode Projects\easyu> code .
    ```

15. Press ENTER, and wait a few seconds. As long as you’ve followed all the steps prior, the code will open on VSCode.

If you encounter any error messages or unexpected statements, let me know, and send a screenshot of the problem. (Or try to figure it out yourself!)

## How to commit (push) changes in terminal

1. After you save your code changes in VSCode, open your terminal (to any folder).

(Steps 2 and 3 only have to be done *once* to set your initial config, not every time you commit a change.)

3. Type `git config --global user.name "Your Name"` and press ENTER.

4. Type `git config --global user.email youremail@example.com` and press ENTER.

5. `cd` into your repo folder.

    ```
    PS C:\Users\ruoha\Documents\VSCode Projects\easyu>
    ```

6. Type `git add .` and press ENTER.

    ```
    PS C:\Users\ruoha\Documents\VSCode Projects\easyu> git add .
    ```

7. Type `git commit -m "your change description"` with your own description of what you changed in the code. Press ENTER.

8. Type `git push` and press ENTER.

9. Now, go to the repo's page on GitHub and see if your changes got pushed!

There is another way to commit/push changes directly on VSCode.

1. In the vertical navigation bar on the left, go to the tab called "Source Control."

2. You'll see a dropdown called "Changes," and under that will be all the folders where you've changed code. Hover over each changed folder, and there'll be a plus sign (+). Click it to stage your changes.

3. Type your change description into the message bar and click "✔ Commit."

4. Click "Sync Changes" to push your changes.
