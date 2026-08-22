import React, {useContext, useEffect, useState} from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'

import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import {apiInstance} from "../../utils/axios.js";
import Cookies from "js-cookie";
import {CartContext} from "../plugin/Context.js";

function Success() {

    const[order, setOrder] = useState([]);
    const[orderMessage, setOrderMessage] = useState("");
    const navigate = useNavigate();
    const [cartCount, setCartCount] = useContext(CartContext);

    const param = useParams();

    const urlParam = new URLSearchParams(window.location.search);
    const sessionId = urlParam.get("session_id")

    const clearCart = async () => {
        try {

            const existingCartId = localStorage.getItem("cartId");
            console.log("opa")
            if (existingCartId) {
                await apiInstance.delete(`cart/clear-cart/${existingCartId}/`);
            }

            if (localStorage.getItem("cartId")) {
                apiInstance.get(`course/cart-list/${localStorage.getItem("cartId")}/`).then((res) => {
                setCartCount(res?.data?.length || 0);
                })
    }
            localStorage.removeItem("cartId");

            console.log("Cart cleared successfully");
        } catch (error) {
            console.error("Error clearing cart:", error);
        }
    };

    useEffect( () => {
        const fetchData = async () => {
            const formdata  = new FormData()
        formdata.append("order_id", param.order_oid)
        formdata.append("session_id", sessionId);
        // formdata.append("paypal_order_id", paypalOrderId);

        setOrderMessage("Processing Payment")

        try{
            const res = await apiInstance.post(`payment/payment-success/${param.order_oid}/`, formdata, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${Cookies.get("access_token")}`
            }
          })

            setOrderMessage(res.data.message)
             if (res.data.message === "Payment Successful") {
                    await clearCart();
                }
        } catch (error) {
            console.log(error.response.data)
            setOrderMessage("Payment Failed")
        }
        };

        fetchData();
    }, []);


        return (
          <>
            <BaseHeader />

            <section className="pt-0  position-relative  overflow-hidden fixed-height-container">
              <div className="container position-relative">
                <div className="row g-5 align-items-center justify-content-center my-5 mx-5">
                    {orderMessage === "Payment Successful" && (
                        <>
                    <div className="col-lg-5 ">
                      <h1 className="text-success">Enrollment Successful!</h1>
                      <p>
                        {" "}
                        Hey there, you enrollment were
                        successful.
                      </p>
                      <button
                        type="button"
                        className="btn btn-primary mb-0 rounded-2"
                        onClick={() => navigate('/student/dashboard/')}
                      >
                        View Enrolled Courses{" "}
                        <i className="fas fa-arrow-right"></i>
                      </button>
                    </div>
                    <div className="col-lg-7 text-center">
                      <img
                        src="https://assets.materialup.com/uploads/bc4c9683-f623-42ef-9014-464ba0411c79/preview.png"
                        className="h-300px h-sm-400px h-md-500px h-xl-700px"
                        alt=""
                      />
                    </div>
                  </>
                    )}
                    {orderMessage === "Processing Payment" && (
                  <>
                    <div className="col-lg-5">
                      <h1 className="text-warning">
                        Processing Payment{" "}
                        <i className="fas fa-spinner fa-spin"></i>
                      </h1>
                      <p>
                        {" "}
                        Hey there, hold on while we process your payment, please
                        do not leave the page.
                      </p>
                    </div>
                    <div className="col-lg-7 text-center">

                    </div>
                  </>
                        )}
                    {orderMessage === "Payment Failed" && (
                  <>
                    <div className="col-lg-5">
                      <h1 className="text-danger">Payment Failed 😔</h1>
                      <p>
                        Unfortunately, phew! Your payment did not go through.{" "}
                        <br /> Please try again.
                      </p>
                      <button
                        type="button"
                        className="btn btn-danger mb-0 rounded-2"
                      >
                        Try again <i className="fas fa-repeat"></i>
                      </button>
                    </div>
                    <div className="col-lg-7 text-center">
                      <img
                        src="https://media3.giphy.com/media/h4OGa0npayrJX2NRPT/giphy.gif?cid=790b76117pc6298jypyph0liy6xlp3lzb7b2y405ixesujeu&ep=v1_stickers_search&rid=giphy.gif&ct=e"
                        className="h-300px h-sm-400px h-md-500px h-xl-700px"
                        alt=""
                      />
                    </div>
                  </>
                        )}
                </div>
              </div>
            </section>

            <BaseFooter />
          </>
        );
}

export default Success