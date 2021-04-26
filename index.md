---
layout: default
title: "Programming Language Wiki"
---

## Languages

<ul class="lang-list">
{% for lang in site.data.languages %}
    <li>
        {% if lang.logo %}
            <img src="{{lang.logo}}" alt="{{lang.name}} logo">
        {% endif %}
        {% if lang.homepage %}
            <a href="{{lang.homepage}}" target="_blank">{{lang.name}}</a>
        {% else %}
            {{lang.name}}
        {% endif %}
    </li>
{% endfor %}
</ul>
