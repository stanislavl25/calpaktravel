<h1>Deployment Pipeline ReadMe</h1>

This deployment pipeline is designed to ensure a smooth and efficient process for deploying new features and edits to production in Shopify. The following guidelines should be followed to ensure successful deployment:
<hr>
Master branch is directly linked to the staging theme in Shopify. Therefore, it should only be used for features that are ready for production. Do not merge anything into the master branch until the team is ready for the edit or feature to go into production.
When working on a ticket or feature, create your own branch and label it with your initials and the title of the ticket or feature. This will help keep the code organized and easily trackable.
Once you have completed your work and are ready to merge your branch into the master branch, create a pull request (PR). However, if the feature or edit is ADA related, make a PR request into the ADA branch.
Once a PR is created, it will be reviewed by the team. If there are any issues or concerns, they will be addressed before the merge is completed. Once the team approves the PR, it can be merged into the master branch.
After the merge is completed, the code will be automatically deployed to production. It is important to monitor the deployment to ensure everything is functioning as expected.
To maintain consistent code styling, please use the following style guides:
For Javascript, use the AirBNB style guide available at https://github.com/airbnb/javascript
For CSS, use the AirBnB style guide available at https://github.com/airbnb/css

<h2>Shopify Deployment:</h2>

The theme Staging will be used as an environment to stage changes that are ready or will be ready to go into production. To put something into production, you will need to first add the feature to the Staging theme (happens automatically when merging code into the Master theme).
Once the Staging theme has been fully QA'd, and if needed, merchandised, then the Staging theme will need to be duplicated. The duplicated theme will need to be renamed to "Production - {{ date }}". This ensures that we have a record of all previous versions of the theme and can easily revert to a previous version if needed.

By following these guidelines, we can ensure a smooth and efficient deployment process that minimizes the risk of errors or issues, and maintains consistent code styling.

<h3>Git CLI Commands: </h3>


<b>To Start: </b>
<ul>
<li>git checkout master</li>
<li>git pull</li>
<li>git checkout {{ initials }}/{{ name/feature }}</li>
</ul>
<b>When ready to push into GitHub</b>
<ul>
<li>git add .</li>
<li>git commit “{{ text about code  }}”</li>
<li>git push</li>
</ul>
