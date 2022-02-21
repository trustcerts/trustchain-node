import axios from 'axios';

describe('Network Testing', () => {
  it('gateway', async () => {
    const did_1 = await axios.get('http://localhost:4541/');
    const did_2 = await axios.get('http://localhost:4551/');

    const dids = [did_1.data.did, did_2.data.did];
    const responses: any = {
      // TODO make endpoints dynamic to run it local and not only in the ci
      resGate1: await axios.get(`http://localhost:4561/did/${dids[0]}`),
      resGate2: await axios.get(`http://localhost:4561/did/${dids[1]}`),
    };
    dids.forEach((did, i) => {
      expect(responses[`resGate${i + 1}`].status).toEqual(200);
      expect(responses[`resGate${i + 1}`].data[0].values.id).toEqual(`${did}`);
      expect(responses[`resGate${i + 1}`].data[0].values.role.add[0]).toEqual(
        'gateway',
      );
    });
  });

  it('observer', async () => {
    const did_1 = await axios.get('http://localhost:4561/');
    const did_2 = await axios.get('http://localhost:4571/');

    const dids = [did_1.data.did, did_2.data.did];
    const responses: any = {
      resObs1: await axios.get(`http://localhost:4561/did/${dids[0]}`),
      resObs2: await axios.get(`http://localhost:4561/did/${dids[1]}`),
    };
    dids.forEach((did, i) => {
      expect(responses[`resObs${i + 1}`].status).toEqual(200);
      expect(responses[`resObs${i + 1}`].data[0].values.id).toEqual(`${did}`);
      expect(responses[`resObs${i + 1}`].data[0].values.role.add[0]).toEqual(
        'observer',
      );
    });
  });
});
