import React from 'react';
import { Form, Input, Button, Card, Row, Col, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { registerUserApi } from '../../apis/api';

const Register = () => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const { confirmPassword, ...data } = values;
      const response = await registerUserApi(data);
      console.log("Register response:", response.data);
      message.success("Registration successful");
      form.resetFields();
    } catch (err) {
      console.log("Register error:", err);
      message.error("Registration failed");
    }
  };

  const validateConfirmPassword = ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('Passwords do not match'));
    },
  });

  return (
    <Row 
      justify="center" 
      align="middle" 
      style={{ 
        minHeight: '100vh',
        background: '#f0f2f5',
        padding: '24px'
      }}
    >
      <Col xs={24} sm={24} md={20} lg={16} xl={14}>
        <Card
          bordered={false}
          style={{
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}
        >
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                padding: '24px'
              }}>
                <img
                  src="/assets/images/main.png"
                  alt="Registration illustration"
                  style={{
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              </div>
            </Col>
            
            <Col xs={24} md={12}>
              <div style={{ padding: '24px 0' }}>
                <h1 style={{ 
                  fontSize: '24px',
                  marginBottom: '32px',
                  textAlign: 'center'
                }}>
                  Create an Account
                </h1>

                <Form
                  form={form}
                  name="register"
                  onFinish={onFinish}
                  layout="vertical"
                  requiredMark={false}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="firstName"
                        rules={[{ required: true, message: 'Please input your first name!' }]}
                      >
                        <Input 
                          prefix={<UserOutlined />} 
                          placeholder="First Name"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="lastName"
                        rules={[{ required: true, message: 'Please input your last name!' }]}
                      >
                        <Input 
                          prefix={<UserOutlined />} 
                          placeholder="Last Name"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: 'Please input your email!' },
                      { type: 'email', message: 'Please enter a valid email!' }
                    ]}
                  >
                    <Input 
                      prefix={<MailOutlined />} 
                      placeholder="Email"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    rules={[{ required: true, message: 'Please input your phone number!' }]}
                  >
                    <Input 
                      prefix={<PhoneOutlined />} 
                      placeholder="Phone Number"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="Password"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: 'Please confirm your password!' },
                      validateConfirmPassword
                    ]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="Confirm Password"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      size="large"
                      block
                      style={{
                        height: '48px',
                        fontSize: '16px',
                        background: '#1B4277'
                      }}
                    >
                      Register
                    </Button>
                  </Form.Item>

                  <div style={{ textAlign: 'center' }}>
                    Already have an account?{' '}
                    <a href="/login" style={{ color: '#1890ff' }}>
                      Login
                    </a>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default Register;