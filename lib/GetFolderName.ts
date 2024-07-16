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
          "無效的資料夾名稱，請使用英文字母、數字、空格、減號、底線。"
        );
      }
    }
  }
  
  export default getValidFolderName;
  