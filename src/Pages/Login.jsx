import React, { useState, useContext } from "react";
import { Container, Row, Col, Form, FormGroup, Button, Input, Alert } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import loginImg from "../assets/images/login.png";
import userIcon from "../assets/images/user.png";
import { AuthContext } from "../context/AuthContext";
import { BASE_URL } from "../utils/config";
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { dispatch, login } = useContext(AuthContext);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/login`, { username, password });

      // Make sure the response includes both user data and token
      const { user, token } = res.data;

      // Store in AuthContext
      login(user, token);

      // Navigate to home page after successful login
      navigate('/');
    } catch (err) {
      console.log(err)
      dispatch({ type: "LOGIN_FAILURE", payload: err.response?.data?.message || 'Login failed' });
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Container>
        <Row>
          <Col lg="8" className="m-auto">
            <div className="login__container d-flex justify-content-between">
              <div className="login__form">
                <h2>Login</h2>
                {error && <Alert color="danger">{error}</Alert>}
                <Form onSubmit={submitHandler}>
                  <FormGroup>
                    <Input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </FormGroup>
                  <Button
                    color="primary"
                    type="submit"
                    className="auth__btn"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </Form>
                <p>
                  Don't have an account? <Link to="/signup">Create</Link>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
