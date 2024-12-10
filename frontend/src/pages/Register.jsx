import UserForm from "../components/Form";
import { Route } from "react-router-dom";

function RegisterComponents(){
    return (
        <UserForm route="user/register/" method="register" />

    )
}

export default RegisterComponents;