import { getPostAction } from '../src/app/admin/posts/actions/posts';

async function main() {
  console.log('Calling getPostAction with slug "chuong-2-he-quan-tri-csdl-truy-van-du-lieu-bang"...');
  try {
    const post = await getPostAction('chuong-2-he-quan-tri-csdl-truy-van-du-lieu-bang');
    console.log('Successfully fetched post! Title:', post?.title);
  } catch (error) {
    console.error('Caught error during action execution:', error);
  }
}

main();
