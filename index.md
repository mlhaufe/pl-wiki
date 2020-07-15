---
layout: default
title: "Programming Language Wiki"
---

## Paradigms

<ul>
{% assign sorted_paradigms = site.categories['Paradigm'] | sort %}
{%  for post in sorted_paradigms %}
    <li><a href='{{ post.url }}'>{{ post.title }}</a></li>
{% endfor %}
</ul>

## Languages

<ul>
{% assign sorted_posts = site.posts | sort:"title" %}
{% for post in sorted_posts %}
    <li><a href='{{ post.url }}'>{{ post.title }}</a></li>
{% endfor %}
</ul>
