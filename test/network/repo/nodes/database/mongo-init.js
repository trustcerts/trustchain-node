db.createUser({
  user: 'root',
  pwd: 'rootpw'
  roles: [
    {
      role: 'dbOwner',
      db: 'trustchain'
    },
  ],
});
