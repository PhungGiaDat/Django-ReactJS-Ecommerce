import UserForm from "../components/Form";
import '../styles/Register.css';

function RegisterComponents() {
    return (
        <div className="register-container">
            <div className="register-form">
                <h2>CREATE ACCOUNT</h2>
                <UserForm route="user/register/" method="register" />
                <div className="checkbox">
                    <input type="checkbox" id="terms" />
                    <label htmlFor="terms">I agree all statements in Terms of service</label>
                </div>
                <button type="submit">SIGN UP</button>
                <a href="/login">Have already an account? Login here</a>
            </div>
        </div>
    );
}

export default RegisterComponents;
