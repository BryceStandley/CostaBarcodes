
class ScaleUser
{
    username = "";
    password = "";
    name = "";
    qrData = "";

    constructor(username: string, password: string)
    {
        
        this.password = password;

        let un = username;
        let n: string[];

        if(!username.includes("@"))
        {
            un += "@costa.local";
            //n = username;
        }
        else
        {
            //n = username.replace("@costa.local", "");
        }

        

        //n = n.split(".");
        let nameTemp = "";
        //n.forEach(element => {
        //    nameTemp += element.charAt(0).toUpperCase() + element.slice(1).toLowerCase() + " ";
        //});

        this.username = un;
        this.name = nameTemp.slice(0, -1);

        this.qrData = un + "^TAB" + password;
    }

}

export default ScaleUser;