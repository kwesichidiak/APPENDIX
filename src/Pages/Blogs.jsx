import React, { useEffect, useState, useContext } from "react";
import CommonSection from "../Shared/CommonSection";
import Newsletter from "../Shared/Newsletter";
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Button } from "reactstrap";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { BASE_URL } from "../utils/config";

const Blogs = () => {
  const { token } = useContext(AuthContext);
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/blogs`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setBlogs(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch blogs.');
      }
    };

    fetchBlogs();
  }, [token]);

  return (
    <div className="blogs-page">
      <Container>
        <Row>
          <Col lg="12" className="mb-4">
            <h2>All Blogs</h2>
            {error && <p className="text-danger">{error}</p>}
          </Col>
          {blogs.map((blog) => (
            <Col lg="4" md="6" sm="12" key={blog._id} className="mb-4">
              <Card>
                {blog.photo && <img src={blog.photo} alt={blog.title} className="card-img-top" />}
                <CardBody>
                  <CardTitle tag="h5">{blog.title}</CardTitle>
                  <CardText>{blog.content.substring(0, 100)}...</CardText>
                  <p><strong>Author:</strong> {blog.author}</p>
                  <Link to={`/blogs/${blog._id}`}>
                    <Button color="primary">Read More</Button>
                  </Link>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Blogs;
