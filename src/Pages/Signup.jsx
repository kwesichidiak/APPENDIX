import React, { useState, useContext } from 'react';
import { Form, FormGroup, Input, Button, Alert } from 'reactstrap';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { BASE_URL } from '../utils/config';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${BASE_URL}/signup`, { username, password });
            // Automatically log in after signup
            const res = await axios.post(`${BASE_URL}/login`, { username, password });
            dispatch({ type: "LOGIN", payload: { user: res.data.user, token: res.data.token } });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed.');
        }
    };

    return (
        <div className="signup-page">
            <h2>Signup</h2>
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
                <Button color="primary" type="submit">Signup</Button>
            </Form>
        </div>
    );
};

export default Signup; 