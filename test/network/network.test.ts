import axios from 'axios';

describe('Network Testing', () => {
  it('gateway', async () => {
    const dids = [
      'did:trust:tc:dev:id:7a5r7AqGaChZ3gE4wmPuGk',
      'did:trust:tc:dev:id:3wyYoWVpKLgxZdCCYfK8zM',
    ];
    const responses: any = {
      // TODO make endpoints dynamic to run it local and not only in the ci
      resGate1: await axios.get(`http://localhost:3560/did/${dids[0]}`),
      resGate2: await axios.get(`http://localhost:3560/did/${dids[1]}`),
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
    const dids = [
      'did:trust:tc:dev:id:BA6Tk61num6ivTCSChLMHH',
      'did:trust:tc:dev:id:GWJz1nTjbeeGBjJcW681UV',
    ];
    const responses: any = {
      resObs1: await axios.get(`http://localhost:3560/did/${dids[0]}`),
      resObs2: await axios.get(`http://localhost:3560/did/${dids[1]}`),
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
