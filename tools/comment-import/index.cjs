const oldData = require('./export.json');
const fs = require('fs');
const path = require('path');

const out = {};

for (const oldComment of oldData) {
  if (!out[oldComment.postId]) {
    out[oldComment.postId] = [];
  }
  out[oldComment.postId].push({
    avatar: oldComment.avatar,
    content: oldComment.content,
    date: new Date(oldComment.date.$date).getTime(),
    email: oldComment.email,
    url: oldComment.url,
    username: oldComment.username,
  });
}

fs.mkdirSync(path.join('dist', 'comments'), { recursive: true });
for (const key of Object.keys(out)) {
  fs.writeFile(path.join('dist', 'comments', `${key}`), JSON.stringify(out[key], undefined, 0), () => {
  });
}
