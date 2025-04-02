import React from "react";
import { render, screen } from "@testing-library/react";

import VehiclesPage from "../VehiclesPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders vehicles page", async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <VehiclesPage />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole("vehicles-datatable")).toBeInTheDocument();
    expect(screen.getByRole("vehicles-add-button")).toBeInTheDocument();
});
