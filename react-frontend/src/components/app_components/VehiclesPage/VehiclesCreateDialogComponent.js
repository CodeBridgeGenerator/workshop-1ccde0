import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import client from "../../../services/restClient";
import _ from "lodash";
import initilization from "../../../utils/init";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";


const getSchemaValidationErrorsStrings = (errorObj) => {
    let errMsg = {};
    for (const key in errorObj.errors) {
      if (Object.hasOwnProperty.call(errorObj.errors, key)) {
        const element = errorObj.errors[key];
        if (element?.message) {
          errMsg[key] = element.message;
        }
      }
    }
    return errMsg.length ? errMsg : errorObj.message ? { error : errorObj.message} : {};
};

const VehiclesCreateDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const urlParams = useParams();
    const [cusrtomerName, setCusrtomerName] = useState([])

    useEffect(() => {
        let init  = {};
        if (!_.isEmpty(props?.entity)) {
            init = initilization({ ...props?.entity, ...init }, [cusrtomerName], setError);
        }
        set_entity({...init});
        setError({});
    }, [props.show]);

    const validate = () => {
        let ret = true;
        const error = {};
          
            if (_.isEmpty(_entity?.plateNo)) {
                error["plateNo"] = `Plate No field is required`;
                ret = false;
            }
        if (!ret) setError(error);
        return ret;
    }

    const onSave = async () => {
        if(!validate()) return;
        let _data = {
            plateNo: _entity?.plateNo,year: _entity?.year,cusrtomerName: _entity?.cusrtomerName?._id,
            createdBy: props.user._id,
            updatedBy: props.user._id
        };

        setLoading(true);

        try {
            
        const result = await client.service("vehicles").create(_data);
        const eagerResult = await client
            .service("vehicles")
            .find({ query: { $limit: 10000 ,  _id :  { $in :[result._id]}, $populate : [
                {
                    path : "cusrtomerName",
                    service : "customers",
                    select:["name"]}
            ] }});
        props.onHide();
        props.alert({ type: "success", title: "Create info", message: "Info Vehicles updated successfully" });
        props.onCreateResult(eagerResult.data[0]);
        } catch (error) {
            console.log("error", error);
            setError(getSchemaValidationErrorsStrings(error) || "Failed to create");
            props.alert({ type: "error", title: "Create", message: "Failed to create in Vehicles" });
        }
        setLoading(false);
    };

    

    

    useEffect(() => {
                    // on mount customers
                    client
                        .service("customers")
                        .find({ query: { $limit: 10000, $sort: { createdAt: -1 }, _id : urlParams.singleCustomersId } })
                        .then((res) => {
                            setCusrtomerName(res.data.map((e) => { return { name: e['name'], value: e._id }}));
                        })
                        .catch((error) => {
                            console.log({ error });
                            props.alert({ title: "Customers", type: "error", message: error.message || "Failed get customers" });
                        });
                }, []);

    const renderFooter = () => (
        <div className="flex justify-content-end">
            <Button label="save" className="p-button-text no-focus-effect" onClick={onSave} loading={loading} />
            <Button label="close" className="p-button-text no-focus-effect p-button-secondary" onClick={props.onHide} />
        </div>
    );

    const setValByKey = (key, val) => {
        let new_entity = { ..._entity, [key]: val };
        set_entity(new_entity);
        setError({});
    };

    const cusrtomerNameOptions = cusrtomerName.map((elem) => ({ name: elem.name, value: elem.value }));

    return (
        <Dialog header="Create Vehicles" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: "40vw" }} className="min-w-max scalein animation-ease-in-out animation-duration-1000" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto"
            style={{ maxWidth: "55vw" }} role="vehicles-create-dialog-component">
            <div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="plateNo">Plate No:</label>
                <InputText id="plateNo" className="w-full mb-3 p-inputtext-sm" value={_entity?.plateNo} onChange={(e) => setValByKey("plateNo", e.target.value)}  required  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["plateNo"]) ? (
              <p className="m-0" key="error-plateNo">
                {error["plateNo"]}
              </p>
            ) : null}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="year">Year:</label>
                <InputNumber id="year" className="w-full mb-3 p-inputtext-sm" value={_entity?.year} onChange={(e) => setValByKey("year", e.value)}  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["year"]) ? (
              <p className="m-0" key="error-year">
                {error["year"]}
              </p>
            ) : null}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="cusrtomerName">Cusrtomer Name:</label>
                <Dropdown id="cusrtomerName" value={_entity?.cusrtomerName?._id} optionLabel="name" optionValue="value" options={cusrtomerNameOptions} onChange={(e) => setValByKey("cusrtomerName", {_id : e.value})}  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["cusrtomerName"]) ? (
              <p className="m-0" key="error-cusrtomerName">
                {error["cusrtomerName"]}
              </p>
            ) : null}
          </small>
            </div>
            <small className="p-error">
                {Array.isArray(Object.keys(error))
                ? Object.keys(error).map((e, i) => (
                    <p className="m-0" key={i}>
                        {e}: {error[e]}
                    </p>
                    ))
                : error}
            </small>
            </div>
        </Dialog>
    );
};

const mapState = (state) => {
    const { user } = state.auth;
    return { user };
};
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
});

export default connect(mapState, mapDispatch)(VehiclesCreateDialogComponent);
