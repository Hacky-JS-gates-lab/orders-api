// Deliberately weak lab app for merge-gate-lab. Do not deploy.
const express = require('express');
const { exec } = require('child_process');
const _ = require('lodash');

const app = express();
app.use(express.json());

const orders = [{ id: 1, owner: 'alice', total: 42 }];

app.get('/orders/:id', (req, res) => {
  const order = orders.find((o) => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ error: 'not found' });
  res.json(order);
});

// Weak on purpose: user input reaches a shell (SAST should flag this).
app.get('/export', (req, res) => {
  exec('echo exporting ' + req.query.format, (err, out) => {
    if (err) return res.status(500).send('failed');
    res.send(out);
  });
});

app.post('/orders/:id/notes', (req, res) => {
  const order = orders.find((o) => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ error: 'not found' });
  _.merge(order, req.body); // Weak on purpose: mass assignment / prototype pollution sink.
  res.json(order);
});

if (require.main === module) {
  app.listen(process.env.PORT || 3000);
}
module.exports = app;
