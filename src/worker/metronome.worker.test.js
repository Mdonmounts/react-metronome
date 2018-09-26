import '@react-frontend-developer/jsdom-worker';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import MetronomeWorker from './metronome.worker';


Enzyme.configure({ adapter: new Adapter() });
const sleep = t => new Promise((r) => { setTimeout(r, t); });


let worker = null;
beforeAll(() => {
    jest.useFakeTimers();
    console.log(MetronomeWorker);
    worker = new Worker(MetronomeWorker);
});

test('Worker file should return a worker script string', () => {
    expect(typeof MetronomeWorker).toBe('string');
});

test('Worker function should be able to turn into a Web Worker', () => {
    // const worker = new Worker(metronomeWorker);
    expect(typeof worker).toBe('object');
});

// onmessage doesn't seem to be working in the worker in the jest env. Debug later.
// Works in browser.
test.skip('Worker should throw error if a non-valid action is passed', () => {
    worker.onmessage = jest.fn();

    worker.postMessage('INVALID');
    expect(worker.onmessage).toHaveBeenCalledWith({data: 'INVALID'});
    expect(() => { worker.postMessage('INVALID') }).toThrowError();
});
