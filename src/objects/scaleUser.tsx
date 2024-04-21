
class ScaleUser
{
    username = "";
    password = "";
    name = "";
    qrData = "";

    SetAndProcess(username: string, password: string)
    {
        this.password = password;

        let un = username;
        let n: string;

        if(!username.includes("@"))
        {
            //Assume a username without a domain is a costas.local user
            un += "@costas.local";
            n = username;
        }
        else
        {
            let name = username !== "" ? username.split('@')[0] : 'Unknown';
            n = name;
            //n = username.replace("@costas.local", "");
        }



        let ns = n.split(".");
        let nameTemp = "";
        ns.forEach(element => {
            nameTemp += element.charAt(0).toUpperCase() + element.slice(1).toLowerCase() + " ";
        });

        this.username = un;
        //console.log(nameTemp);
        this.name = nameTemp.slice(0, -1);

        this.qrData = un + '\t' + password;
    }

}

export default ScaleUser;