# AppMap






| Summary | Status |
| --- | --- |
| [Test failures](#test-failures) | :warning: 3 failed |
| [API changes](#api-changes) |🚧 4 breaking,&nbsp;:wrench: 1 non-breaking  |
| [Findings](#findings) |  :tada: 4 resolved  |
| [New AppMaps](#new-appmaps) |  :star: 1 new  |
| [Changed code behavior](#changed-code-behavior) |  :twisted_rightwards_arrows: 1 changes  |

## :warning: Test failures


<details>
<summary>
test/controllers/microposts_controller_test.rb:24
</summary>

<p/>

[test/controllers/microposts_controller_test.rb:24](test/controllers/microposts_controller_test.rb:24) failed with error:

```
NoMethodError: undefined method `micropost_path' for #<MicropostsControllerTest:0x00007f311d97a068>
Did you mean?  microposts
    test/controllers/microposts_controller_test.rb:28:in `block (2 levels) in <class:MicropostsControllerTest>'
    test/controllers/microposts_controller_test.rb:27:in `block in <class:MicropostsControllerTest>'
```




No relevant code changes found.

| Diagram | Link |
| --- | --- |
| Sequence diagram diff | [minitest/Microposts_controller_should_redirect_destroy_for_wrong_micropost.diff.sequence.json](diff/minitest/Microposts_controller_should_redirect_destroy_for_wrong_micropost.diff.sequence.json) |
| AppMap | [minitest/Microposts_controller_should_redirect_destroy_for_wrong_micropost](head/minitest/Microposts_controller_should_redirect_destroy_for_wrong_micropost.appmap.json) |

</details>


<details>
<summary>
test/integration/microposts_interface_test.rb:9
</summary>

<p/>

[test/integration/microposts_interface_test.rb:9](test/integration/microposts_interface_test.rb:9) failed with error:

```
ActionView::Template::Error: undefined method `micropost_path' for #<ActionView::Base:0x00000000028410>

              target.public_send(method, *args)
                    ^^^^^^^^^^^^
Did you mean?  microposts_path
    app/views/microposts/_micropost.html.erb:13
    app/views/shared/_feed.html.erb:3
    app/views/static_pages/home.html.erb:16
    test/integration/microposts_interface_test.rb:11:in `block in <class:MicropostsInterfaceTest>'
```




No relevant code changes found.

| Diagram | Link |
| --- | --- |
| Sequence diagram diff | [minitest/Microposts_interface_micropost_interface.diff.sequence.json](diff/minitest/Microposts_interface_micropost_interface.diff.sequence.json) |
| AppMap | [minitest/Microposts_interface_micropost_interface](head/minitest/Microposts_interface_micropost_interface.appmap.json) |

</details>


<details>
<summary>
test/integration/users_login_test.rb:45
</summary>

<p/>

[test/integration/users_login_test.rb:45](test/integration/users_login_test.rb:45) failed with error:

```
ActionView::Template::Error: undefined method `micropost_path' for #<ActionView::Base:0x0000000002b3e0>

              target.public_send(method, *args)
                    ^^^^^^^^^^^^
Did you mean?  microposts_path
    app/views/microposts/_micropost.html.erb:13
    app/views/users/show.html.erb:19
    test/integration/users_login_test.rb:46:in `block in <class:ValidLoginTest>'
```




No relevant code changes found.

| Diagram | Link |
| --- | --- |
| AppMap | [minitest/Valid_login_redirect_after_login](head/minitest/Valid_login_redirect_after_login.appmap.json) |

</details>



## 🔄 API changes

### 🚧 Breaking changes

  - Remove path `paths./microposts/{id}` 
  - Remove response status code `paths./microposts.post.responses.302` 
  - Remove response status code `paths./microposts.post.responses.303` 
  - Remove response status code `paths./microposts.post.responses.422` 

### :wrench: Non-breaking changes

  - Add response status code  `paths./microposts.post.responses.200`


<details>
<summary>
  Detailed OpenAPI diff
</summary>

```diff
--- base/openapi.yml	2023-08-17 12:23:50.000000000 -0400
+++ head/openapi.yml	2023-08-17 12:28:49.000000000 -0400
@@ -100,18 +100,9 @@
   /microposts:
     post:
       responses:
-        '302':
-          content:
-            text/html: {}
-          description: Found
-        '303':
-          content:
-            text/html: {}
-          description: See Other
-        '422':
-          content:
-            text/html: {}
-          description: Unprocessable Entity
+        '200':
+          content: {}
+          description: OK
       requestBody:
         content:
           application/x-www-form-urlencoded:
@@ -123,13 +114,6 @@
                   properties:
                     content:
                       type: string
-  /microposts/{id}:
-    delete:
-      responses:
-        '303':
-          content:
-            text/html: {}
-          description: See Other
   /password_resets:
     post:
       responses:
```
</details>



<h2 id="findings">Findings</h2>


### :tada: Resolved findings (4)


### N plus 1 SQL query

<details>
<summary>
  Finding details
</summary>

| Field | Value |
| --- | --- |
| Message | app_views_shared__feed_html_erb.render[418] contains 30 occurrences of SQL: SELECT &quot;users&quot;.* FROM &quot;users&quot; WHERE &quot;users&quot;.&quot;id&quot; &#x3D; ? LIMIT ? |
| AppMap | [minitest/Microposts_interface_micropost_interface.appmap.json](head/minitest/Microposts_interface_micropost_interface.appmap.json) |

##### Related code changes
No relevant code changes found.

##### Stack trace

* [app/helpers/sessions_helper.rb:19](app/helpers/sessions_helper.rb:19)
* [app/helpers/sessions_helper.rb:35](app/helpers/sessions_helper.rb:35)
* [app/views/shared/_feed.html.erb](app/views/shared/_feed.html.erb)
* [app/views/static_pages/home.html.erb](app/views/static_pages/home.html.erb)
* /home/ahtrotta/.rbenv/versions/3.1.2/lib/ruby/gems/3.1.0/gems/actionpack-7.0.4/lib/action_controller/metal/renderers.rb:140


</details>

### N plus 1 SQL query

<details>
<summary>
  Finding details
</summary>

| Field | Value |
| --- | --- |
| Message | app_views_shared__feed_html_erb.render[2707] contains 30 occurrences of SQL: SELECT &quot;users&quot;.* FROM &quot;users&quot; WHERE &quot;users&quot;.&quot;id&quot; &#x3D; ? LIMIT ? |
| AppMap | [minitest/Microposts_interface_micropost_interface.appmap.json](head/minitest/Microposts_interface_micropost_interface.appmap.json) |

##### Related code changes
No relevant code changes found.

##### Stack trace

* [app/helpers/sessions_helper.rb:19](app/helpers/sessions_helper.rb:19)
* [app/helpers/sessions_helper.rb:35](app/helpers/sessions_helper.rb:35)
* [app/views/shared/_feed.html.erb](app/views/shared/_feed.html.erb)
* [app/views/static_pages/home.html.erb](app/views/static_pages/home.html.erb)
* /home/ahtrotta/.rbenv/versions/3.1.2/lib/ruby/gems/3.1.0/gems/actionpack-7.0.4/lib/action_controller/metal/renderers.rb:140
* [app/controllers/microposts_controller.rb:5](app/controllers/microposts_controller.rb:5)


</details>

### N plus 1 SQL query

<details>
<summary>
  Finding details
</summary>

| Field | Value |
| --- | --- |
| Message | app_views_shared__feed_html_erb.render[3734] contains 30 occurrences of SQL: SELECT &quot;users&quot;.* FROM &quot;users&quot; WHERE &quot;users&quot;.&quot;id&quot; &#x3D; ? LIMIT ? |
| AppMap | [minitest/Microposts_interface_micropost_interface.appmap.json](head/minitest/Microposts_interface_micropost_interface.appmap.json) |

##### Related code changes
No relevant code changes found.

##### Stack trace

* [app/helpers/sessions_helper.rb:19](app/helpers/sessions_helper.rb:19)
* [app/helpers/sessions_helper.rb:35](app/helpers/sessions_helper.rb:35)
* [app/views/shared/_feed.html.erb](app/views/shared/_feed.html.erb)
* [app/views/static_pages/home.html.erb](app/views/static_pages/home.html.erb)
* /home/ahtrotta/.rbenv/versions/3.1.2/lib/ruby/gems/3.1.0/gems/actionpack-7.0.4/lib/action_controller/metal/renderers.rb:140


</details>

### N plus 1 SQL query

<details>
<summary>
  Finding details
</summary>

| Field | Value |
| --- | --- |
| Message | app_views_users_show_html_erb.render[4559] contains 6 occurrences of SQL: SELECT &quot;users&quot;.* FROM &quot;users&quot; WHERE &quot;users&quot;.&quot;id&quot; &#x3D; ? LIMIT ? |
| AppMap | [minitest/Microposts_interface_micropost_interface.appmap.json](head/minitest/Microposts_interface_micropost_interface.appmap.json) |

##### Related code changes
No relevant code changes found.

##### Stack trace

* [app/helpers/sessions_helper.rb:19](app/helpers/sessions_helper.rb:19)
* [app/helpers/sessions_helper.rb:40](app/helpers/sessions_helper.rb:40)
* [app/views/users/show.html.erb](app/views/users/show.html.erb)
* /home/ahtrotta/.rbenv/versions/3.1.2/lib/ruby/gems/3.1.0/gems/actionpack-7.0.4/lib/action_controller/metal/renderers.rb:140


</details>




<h2 id="new-appmaps">New AppMaps</h2>


[minitest/Valid_login_redirect_after_login](head/minitest/Valid_login_redirect_after_login.appmap.json)



## :twisted_rightwards_arrows: Changed code behavior

<details>

<summary>
Review 1 changes
</summary>


```
removed SQL `PRAGMA foreign_keys = ON`
```

- [minitest/Microposts_controller_should_redirect_destroy_for_wrong_micropost](diff/minitest/Microposts_controller_should_redirect_destroy_for_wrong_micropost.diff.sequence.json)


</details>
