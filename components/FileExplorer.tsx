import { StorageManager } from '@aws-amplify/ui-react-storage';
import '@aws-amplify/ui-react/styles.css';

export const DefaultStorageManagerExample = () => {
  return (
    <StorageManager
      acceptedFileTypes={['Image/*']}
      path="Doc/"
      maxFileCount={1}
      autoUpload={false}
      isResumable
    />
  );
};

export default DefaultStorageManagerExample;