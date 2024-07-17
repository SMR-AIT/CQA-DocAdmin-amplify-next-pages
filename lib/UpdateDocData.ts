import { generateClient } from "aws-amplify/api";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { list } from 'aws-amplify/storage';


Amplify.configure(outputs);

const client = generateClient<Schema>({ authMode: "apiKey", });

const file_ebd = '/Embeddings.npy'
const file_txt = '/Extract_doc_squeezed.txt'
const file_sum = '/Summary_chatgpt.txt'

function removeFileExtension(filePath:string) {
    const lastDotIndex = filePath.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return filePath; // No extension found
    }
    return filePath.slice(0, lastDotIndex);
  }

export async function updateDocStatus() {
    const s3_result = await list({ path: 'txt/', });
    const s3_keys = s3_result['items'].map((item) => item['path'].slice(4))
    console.log(s3_keys)
    
    const embeds = s3_keys.filter((key) => key.endsWith(file_ebd)).map((file)=>file.slice(0, -file_ebd.length))
    const txts = s3_keys.filter((key) => key.endsWith(file_txt)).map((file)=>file.slice(0, -file_txt.length))
    const summaries = s3_keys.filter((key) => key.endsWith(file_sum)).map((file)=>file.slice(0, -file_sum.length))
    console.log(embeds)
    console.log(txts)
    console.log(summaries)

    const data_result = await client.models.Doc.list()
    const data_ids = data_result['data'].map((data) => removeFileExtension(data.id))
    console.log(data_ids)

    for (const id of data_ids){
        console.log(id)
        if (txts.includes(id)){
            try{
                const result = client.models.Doc.update({ id: id, statusText: 'Done' });
                console.log(result)
            }catch(error){
                console.log(error);
            }
        }else if(embeds.includes(id)){
            try{
                const result = client.models.Doc.update({ id: id, statusEmbed: 'Done' });
                console.log(result)
            }catch(error){
                console.log(error);
            }
        }else if(summaries.includes(id)){
            try{
                const result = client.models.Doc.update({ id: id, statusSummary: 'Done' });
                console.log(result)
            }catch(error){
                console.log(error);
            }
        }else{
            console.log('None match')
        }
    }
}