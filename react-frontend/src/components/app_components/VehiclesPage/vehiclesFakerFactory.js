
import { faker } from "@faker-js/faker";
export default (user,count,cusrtomerNameIds) => {
    let data = [];
    for (let i = 0; i < count; i++) {
        const fake = {
plateNo: faker.datatype.number(""),
year: faker.datatype.number(""),
cusrtomerName: cusrtomerNameIds[i % cusrtomerNameIds.length],

updatedBy: user._id,
createdBy: user._id
        };
        data = [...data, fake];
    }
    return data;
};
