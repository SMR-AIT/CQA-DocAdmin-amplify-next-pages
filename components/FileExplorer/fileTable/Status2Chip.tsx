import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export function status2chip(status: string) {
    if (status == "完成" || status == "Done") {
        return <Chip label={status} color="success" size="small" variant="outlined" />
    } else if (status == "未完成" || status == "Undone") {
        return <Chip label={status} color="warning" size="small" variant="outlined" />
    } else if (status == "執行中" || status == "Pending") {
        return <Chip label={status} color="primary" size="small" variant="outlined" />
        // return  <CircularProgress size='1rem'/>
    }
}