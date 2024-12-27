const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());
const baseUrl = "https://data-collection-fbn6t4.5sc6y6-1.usa-e2.cloudhub.io/api"
app.get('/process-lift-data', async (req, res) => {
    try {
        const response = await axios.get(
            `${baseUrl}/fetchData`,
            {
                params: {
                    operationalStatus: 'Operational',
                    customerFacingFlag: true,
                    inCommissionFlag: true,
                },
            }
        );

        const filteredData = response?.data?.data?.resultSet?.filter(
            (item) => item.status === 'Available'
        );
        const liftData = filteredData?.map((item) => ({
            StationName: item?.station?.name,
            CRSCode: item?.station?.crsCode,
            SensorId: item?.blockId,
        }));
        console.log("filteredData", JSON.stringify(liftData))

        const postData = { LiftData: liftData };

        const postResponse = await axios.post(
            `${baseUrl}/createAlert`,
            postData
        );

        res.status(200).json({
            message: 'Lift data processed and sent successfully',
            response: postResponse.data,
        });
    } catch (error) {
        console.error('Error processing lift data:', error.message);
        res.status(500).json({ message: 'Error processing lift data', error: error.message });
    }
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log("Server running on ${PORT}");
});