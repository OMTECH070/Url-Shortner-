import {createServer} from 'http' 
import {readFile,writeFile} from 'fs/promises' 
import path from 'path' 
import {fileURLToPath} from 'url' 
import crypto from 'crypto' 
 
const __filename = fileURLToPath(import.meta.url) 
const __dirname = path.dirname(__filename) 
 
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
 
const DATA_FILE=path.join("data","links.json") 
 
const serverFile = async (res,Filepath,Type)=>{ 
    try{ 
        const data = await readFile(Filepath) 
        res.writeHead(200,Type) 
        res.end(data) 
    }catch(err){ 
        console.log(err) 
        res.writeHead(404,{"Content-Type":"text/plain"}) 
        res.end("404 page not found") 
    } 
} 

const loadLinks = async()=>{ 
    try{ 
        const data = await readFile(DATA_FILE,"utf8") 
        return JSON.parse(data) 
    }catch(err){ 
        if(err.code==="ENOENT"){ 
            await writeFile(DATA_FILE,JSON.stringify({})) 
        } 
        throw err 
    } 
} 

const saveLinks = async(links)=>{ 
    await writeFile(DATA_FILE,JSON.stringify(links)) 
} 
 
const server = createServer(async (req,res)=>{ 
    if(req.method==="GET"){ 
        if(req.url=="/"){ 
            return serverFile(res,path.join(__dirname,'public','index.html'),{"Content-Type":"text/html"}) 
        }else if(req.url=="/css/style.css"){ 
            return serverFile(res,path.join(__dirname,'css','style.css'),{"Content-Type":"text/css"}) 
        }else if(req.url=="/links"){
            const links= await loadLinks()
            res.writeHead(200,{"Content-Type":"application/json"}) 
            return res.end(JSON.stringify(links))
        }else{
            const links =await loadLinks()
            const shortCode =req.url.slice(1)
            console.log("link redirect",req.url)
            if(links[shortCode]){
                res.writeHead(302,{location:links[shortCode]})
                return res.end()
            }
            res.writeHead(404,{"Content-Type":"text/plain"})
            return res.end("Shortened URL is not found")
        }
    } 

    if (req.method==="POST" && req.url==="/shorten"){ 
        const links= await loadLinks() 

        let data="" 

        req.on('data',(chunk)=>{ 
            data += chunk  
        }) 

        req.on('end',async ()=>{ 
            console.log(data) 

            const {url,shortCode} = JSON.parse(data) 
 
            if(!url){ 
                res.writeHead(400,{"Content-Type":"text/plain"}) 
                return res.end("URL is required") 
            } 

            const finalShortCode=shortCode || crypto.randomBytes(4).toString("hex") 

            if(links[finalShortCode]) { 
                res.writeHead(400,{"Content-Type":"text/plain"}) 
                return res.end("Short code already exist.Plsease choose another") 
            } 

            links[finalShortCode]=url 
 
            await saveLinks(links) 

            res.writeHead(200,{"Content-Type":"text/plain"}) 
            res.end(JSON.stringify({success:true,shortCode:finalShortCode})) 
        }) 
    } 
}) 

server.listen(PORT,()=>{ 
    console.log(`Server running at port ${PORT}`) 
})