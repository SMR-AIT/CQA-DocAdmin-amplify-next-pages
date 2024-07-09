import { IoDocumentTextOutline  } from "react-icons/io5";
import { FaFolder } from "react-icons/fa";
import { FaRegFileImage  } from "react-icons/fa";
import { GrDocumentPdf } from "react-icons/gr";

function getIcon(type: string) {
    if (type === 'folder') {
        return <FaFolder />
    } else if (type === 'application/pdf') {
        return <GrDocumentPdf />
    } else if (type.startsWith("image/")) {
        return <FaRegFileImage />
    } else {
        return <IoDocumentTextOutline  />;
    }
}

export default getIcon;