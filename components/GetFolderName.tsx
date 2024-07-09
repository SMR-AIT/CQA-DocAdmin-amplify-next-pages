function getValidFolderName() {
  const validFolderNameRegex = /^[a-zA-Z0-9_\-\u4e00-\u9fa5 ]+$/;

  while (true) {
    const folderName = window.prompt("Enter a valid folder name:");

    if (folderName === null) {
      // User canceled the prompt
      return null;
    } else if (validFolderNameRegex.test(folderName)) {
      // Folder name is valid
      return folderName;
    } else {
      // Folder name is invalid, show an alert and prompt again
      alert(
        "Invalid folder name. Please use only letters, numbers, spaces, hyphens, and underscores."
      );
    }
  }
}

export default getValidFolderName;
