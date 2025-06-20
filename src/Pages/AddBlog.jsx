import React, { useState, useContext, useEffect } from 'react';
import { Form, FormGroup, Input, Button, Alert } from 'reactstrap';
import axios from 'axios';
import { BASE_URL } from '../utils/config';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AddBlog = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [photo, setPhoto] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Please login to add a blog');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    }, [token, navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();

        if (!token) {
            setError('Authentication required');
            return;
        }

        try {
            await axios.post(`${BASE_URL}/blogs`,
                { title, photo, content },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                }
            );
            setSuccess('Blog added successfully!');
            setTimeout(() => {
                navigate('/blogs');
            }, 2000);
        } catch (err) {
            console.error('Error details:', err.response?.data);
            setError(err.response?.data?.message || 'Failed to add blog.');
        }
    };

    return (
        <div className="add-blog-page">
            <h2>Add New Blog</h2>
            {error && <Alert color="danger">{error}</Alert>}
            {success && <Alert color="success">{success}</Alert>}
            <Form onSubmit={submitHandler}>
                <FormGroup>
                    <Input
                        type="text"
                        placeholder="Blog Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Input
                        type="text"
                        placeholder="Photo URL"
                        value={photo}
                        onChange={(e) => setPhoto(e.target.value)}
                    />
                </FormGroup>
                <FormGroup>
                    <Input
                        type="textarea"
                        placeholder="Content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </FormGroup>
                <Button color="primary" type="submit">Add Blog</Button>
            </Form>
        </div>
    );
};

export default AddBlog; 