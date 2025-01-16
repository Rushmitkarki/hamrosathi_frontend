import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Checkbox,
  Modal,
  Steps,
  message,
  Card,
  Row,
  Col,
  Divider,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  GoogleOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { jwtDecode } from "jwt-decode";
import {
  forgotPasswordApi,
  loginUserApi,
  resetPasswordApi,
  verifyOtpApi,
  googleLoginApi,
} from "../../apis/api";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [form] = Form.useForm();
  const [resetForm] = Form.useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [resetContact, setResetContact] = useState("");

  const handleLogin = async (values) => {
    try {
      // Validate the values before making the API request
      if (!values.email || !values.password) {
        message.error("Please enter both email and password");
        return;
      }

      const res = await loginUserApi(values);

      if (res.data.success === false) {
        message.error(res.data.message); // Error message from the API response
      } else {
        message.success(res.data.message); // Success message from the API response

        // Store token and user data in localStorage
        localStorage.setItem("token", res.data.token);
        const user = res.data.userData;
        localStorage.setItem("user", JSON.stringify(user));

        // Decode the JWT token to extract user info

        // Navigate to the appropriate page based on user role
        if (user.isAdmin) {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      }
    } catch (err) {
      // Catch network or other errors
      message.error("Login Failed. Please try again.");
      console.error(err);
    }
  };

  const handleForgotPassword = async (values) => {
    try {
      switch (currentStep) {
        case 0:
          await forgotPasswordApi({ contact: values.contact });
          setResetContact(values.contact);
          message.success("OTP sent successfully");
          setCurrentStep(1);
          break;
        case 1:
          await verifyOtpApi({ contact: resetContact, otp: values.otp });
          message.success("OTP verified successfully");
          setCurrentStep(2);
          break;
        case 2:
          if (values.newPassword !== values.confirmPassword) {
            message.error("Passwords do not match");
            return;
          }
          await resetPasswordApi({
            contact: resetContact,
            otp: resetForm.getFieldValue("otp"),
            password: values.newPassword,
          });
          message.success("Password reset successfully");
          setIsModalVisible(false);
          resetForm.resetFields();
          setCurrentStep(0);
          break;
      }
    } catch (err) {
      message.error("Operation failed. Please try again.");
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const res = await googleLoginApi({
        token: credentialResponse.credential,
      });

      if (res.data.success === false) {
        message.error(res.data.message); // Error message from the API response
      } else {
        message.success(res.data.message); // Success message from the API response

        // Store token and user data in localStorage
        localStorage.setItem("token", res.data.token);
        const user = res.data.user;
        localStorage.setItem("user", JSON.stringify(user));

        // Navigate to the appropriate page based on user role
        if (user.isAdmin) {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      }
    } catch (err) {
      // Catch network or other errors
      message.error("Google Login Failed. Please try again.");
      console.error(err);
    }
  };

  const handleGoogleLoginFailure = () => {
    message.error("Google Login Failed. Please try again.");
  };

  const steps = [
    {
      title: "Contact",
      content: (
        <Form.Item
          name="contact"
          rules={[
            { required: true, message: "Please enter your email or phone" },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Email or Phone Number"
          />
        </Form.Item>
      ),
    },
    {
      title: "Verify",
      content: (
        <Form.Item
          name="otp"
          rules={[{ required: true, message: "Please enter OTP" }]}
        >
          <Input
            prefix={<LockOutlined />}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
          />
        </Form.Item>
      ),
    },
    {
      title: "Reset",
      content: (
        <>
          <Form.Item
            name="newPassword"
            rules={[{ required: true, message: "Please enter new password" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="New Password"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            rules={[{ required: true, message: "Please confirm password" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
            />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Row
        justify="center"
        align="middle"
        style={{ minHeight: "100vh", background: "#f0f2f5" }}
      >
        <Col xs={22} sm={20} md={16} lg={14} xl={12}>
          <Card>
            <Row gutter={24}>
              <Col
                xs={24}
                md={12}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src="/assets/images/main.png"
                  alt="Login"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </Col>
              <Col xs={24} md={12}>
                <h1 style={{ textAlign: "center", marginBottom: 24 }}>
                  Login to your account
                </h1>
                <Form form={form} onFinish={handleLogin} layout="vertical">
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: "Please enter your email" },
                      { type: "email", message: "Please enter a valid email" },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="Email"
                      size="large"
                    />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: "Please enter your password" },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Password"
                      size="large"
                    />
                  </Form.Item>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Checkbox
                        onChange={(e) => setShowPassword(e.target.checked)}
                      >
                        Show Password
                      </Checkbox>
                    </Col>
                    <Col>
                      <Button
                        type="link"
                        onClick={() => setIsModalVisible(true)}
                      >
                        Forgot password?
                      </Button>
                    </Col>
                  </Row>
                  <Form.Item style={{ marginTop: 24 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      size="large"
                      style={{
                        background: "#1B4277",
                      }}
                    >
                      Login
                    </Button>
                  </Form.Item>
                  <Divider>OR</Divider>
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginFailure}
                    useOneTap
                  />
                  <div style={{ textAlign: "center", marginTop: 16 }}>
                    Don't have an account? <a href="/register">Register</a>
                  </div>
                </Form>
              </Col>
            </Row>
          </Card>
        </Col>

        <Modal
          title="Reset Password"
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setCurrentStep(0);
            resetForm.resetFields();
          }}
          footer={null}
        >
          <Steps
            current={currentStep}
            items={steps}
            style={{ marginBottom: 24 }}
          />
          <Form form={resetForm} onFinish={handleForgotPassword}>
            {steps[currentStep].content}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{
                  background: "#1B4277",
                }}
              >
                {currentStep === 0
                  ? "Send OTP"
                  : currentStep === 1
                  ? "Verify OTP"
                  : "Reset Password"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Row>
    </GoogleOAuthProvider>
  );
};

export default Login;
